const _ = require('lodash');

const DatabaseSchema = require('../database/index');
const lcd = require('../lib/lcd/index');

const compactObject = obj => {
  return Object.entries(obj)
    .reduce((accumulator, current) => {
      return current[1] != null ? { ...accumulator, [current[0]]: current[1] } : accumulator;
    }, {});
};

const saveConfiguration = (configuration, context, namespace) => {
  Object.keys(configuration)
    .filter(key => key !== 'translations')
    .forEach(key => context.set(`${namespace}_${key}`, configuration[key]));
  // save dictionary if present
  if (configuration != null && configuration.translations != null) {
    const currentDictionary = context.get('dictionary') || {};
    context.set('dictionary', { ...currentDictionary, ...configuration.translations });
    context.set('tx', tx.bind(context));
  }
};

const tx = function(key, language, predefined) {
  const dictionary = this.get('dictionary') || {};

  if (typeof key !== 'string') {
    // eslint-disable-next-line no-console
    console.error('Error in TX function: "key" is not a string');
  }
  if (typeof language !== 'string') {
    // eslint-disable-next-line no-console
    console.error('Error in TX function: "language" is not a string');
  }
  if (dictionary[key] != null && dictionary[key][language] != null) {
    return dictionary[key][language];
  } else if (dictionary[key] != null && dictionary[key][predefined] != null) {
    return dictionary[key][predefined];
  }
  return key;
};

module.exports = function(RED) {
  const { Events } = require('./mc')(RED);

  function MissionControlConfiguration(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    this.namespace = config.namespace;
    this.debug = config.debug;
    this.chatbotId = config.chatbotId;

    const databaseSchema = DatabaseSchema();
    const { Configuration } = databaseSchema;

    Configuration.findOne({ where: compactObject({
      namespace: node.namespace,
       chatbotId: !_.isEmpty(node.chatbotId) ? node.chatbotId : undefined
    })}).then(response => {
      if (response == null || _.isEmpty(response.payload)) {
        // eslint-disable-next-line no-console
        console.log(`Configuration for ${node.namespace} not found`);
        return;
      }
      let configuration;
      try {
        configuration = JSON.parse(response.payload);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Invalid configuration payload')
      }

      const payload = _.omit(configuration, 'namespace');
      if (node.debug) {
        // eslint-disable-next-line no-console
        console.log(lcd.green('Initial configuration received') + ' (' + lcd.grey(this.namespace) +')');
        // eslint-disable-next-line no-console
        console.log(lcd.prettify(_.omit(payload, 'translations'), { indent: 2 }));
      }
      saveConfiguration(payload, this.context().global, node.namespace);
      node.send({ payload });
    });

    // handle changes of configuration from MC
    const handler = (topic, payload) => {
      if (topic === 'mc.configuration') {
        const { namespace, chatbotId, ...rest } = payload;
        if (_.isEmpty(namespace)) {
          // eslint-disable-next-line no-console
          console.log('Error: configuration payload without namespace');
          return;
        }
        // skip different namespace
        if (namespace !== node.namespace) {
          return;
        }
        // skip if different chatbotid
        if (!_.isEmpty(node.chatbotId) && node.chatbotId !== chatbotId) {
          return;
        }
        saveConfiguration(rest, this.context().global, node.namespace);
        // pass through
        node.send({ payload: rest });
      }
    };
    Events.on('message', handler);

    this.on('close', done => {
      Events.removeListener('message', handler);
      done();
    });
  }

  RED.nodes.registerType('mc-configuration', MissionControlConfiguration);
};
