const prompts = require('prompts');
const _ = require('lodash');
const { writeFileSync, existsSync, lstatSync, readFileSync } = require('fs');

const lcd = require('../lib/lcd/index');

const projects = readFileSync(`${__dirname}/../.local-bots`, 'utf8')
  .split('\n')
  .filter(str => !_.isEmpty(str));
const folderExists = dir => existsSync(dir) && lstatSync(dir).isDirectory();

(async () => {
  // eslint-disable-next-line no-console
  console.log(lcd.orange('RedBot Dev Environment') + ': ' + lcd.white('v0.2'));
  // eslint-disable-next-line no-console
  console.log('');
  const response = await prompts(
    {
      type: 'select',
      name: 'value',
      message: 'Project to run',
      choices: [
        ...projects
          .map((item) => {
            const [name, dir, projects] = item.split(',');
            return {
              title: name,
              description: `${dir} - (${projects === 'PROJECTS' ? 'projects' : 'standalone'})`,
              value: item
            }
          }),
        { title: 'New', value: 'new' },
        { title: 'Quit', value: 'quit' }
      ],
      initial: 0
    }
  );

  if (response.value === 'quit') {
    // eslint-disable-next-line no-console
    console.log('Quitting.');
    // eslint-disable-next-line no-console
    console.log('');
    process.exit(1);
  } else if (response.value === 'new') {

    const responseName = await prompts({
      type: 'text',
      name: 'value',
      message: 'Project name',
      //validate: value => value != null && value !== '' ? true : `Invalid plugin name, juste letters and numbers or "_", "-"`
      validate: value => {
        if (_.isEmpty(value)) {
          return 'Project name cannot be empty.';
        } else if (value.includes(',')) {
          return 'Please don\'t include commas in the project name';
        }
        return true;
      }
    });
    const responseDir = await prompts({
      type: 'text',
      name: 'value',
      message: 'Project path',
      description: 'Please create an empty dir',
      validate: value => {
        if (!folderExists(value)) {
          return 'Path is invalid or is not a folder.';
        }
        return true;
      }
    });
    const responseProjects = await prompts(
      {
        type: 'select',
        name: 'value',
        message: 'Enable Node-RED projects',
        choices: [
          { title: 'Yes', value: 'PROJECTS' },
          { title: 'No', value: 'STANDALONE' }
        ],
        initial: 0
      }
    );
    // update local bots
    writeFileSync(
      `${__dirname}/../.local-bots`,
      [...projects, `${responseName.value},${responseDir.value},${responseProjects.value}`].join('\n'),
      'utf8'
    );
    // update .env file
    const env = [
      'REDBOT_DIR=.',
      'REDBOT_ENABLE_MISSION_CONTROL=true',
      'DEVELOPMENT_MODE=true',
      `DATA_DIR=${responseDir.value}`,
      `NODE_RED_ENABLE_PROJECTS=${responseProjects.value}`
    ];
    writeFileSync(`${__dirname}/../.env`, env.join('\n'));

    // eslint-disable-next-line no-console
    console.log(`Starting ${responseName.value} (${responseDir.value})`);

  } else {
    const [name, dir, projects] = response.value.split(',');

    // eslint-disable-next-line no-console
    console.log(`Starting ${name} (${dir})`);

    if (!folderExists(dir)) {
      // eslint-disable-next-line no-console
      console.log(`Folder ${dir} doesn't exist or it's not a folder.`);
      process.exit(1);
    }

    const env = [
      'REDBOT_DIR=.',
      'REDBOT_ENABLE_MISSION_CONTROL=true',
      'DEVELOPMENT_MODE=true',
      `DATA_DIR=${dir}`,
      'NODE_RED_ENABLE_PROJECTS=' + (projects === 'PROJECTS' ? 'true' : 'false')
    ];

    writeFileSync(`${__dirname}/../.env`, env.join('\n'));
  }
})();