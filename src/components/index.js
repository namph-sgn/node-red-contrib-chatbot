import CollectionEditor from './collection-editor';
import * as HelpElements from './help-elements';
import withConfigurationPage from './configuration-page';
import ContentAutocomplete from './content-autocomplete';
import Dictionary from './dictionary';
import * as Content from './content';
import * as Modal from './modal';
import Confidence from './confidence';
import JsonEditor from './json-editor';
import TableFilters from './table-filters';
import UserAutocomplete from './user-autocomplete';
import SelectTransport from './select-transport';
import Panel from './grid-panel';
import * as WidgetForm from './widget-form';
import InputInteger from './input-integer';
import PageContainer from './page-container';
import ChatbotStatus from './chatbot-status';
import SmallTag from './small-tag';
import EditDevice from './edit-device';
import MarkdownViewer from './markdown-viewer';
import { UserRecords } from './user-records';
import Maps from './maps';
import Breadcrumbs from './breadcrumbs';

// Define the global scope to store the components shared with plugins
if (window.globalLibs == null) {
  window.globalLibs = {};
}
window.globalLibs.Components = {
  CollectionEditor,
  HelpElements,
  withConfigurationPage,
  ContentAutocomplete,
  Dictionary,
  Confidence,
  Content,
  JsonEditor,
  TableFilters,
  UserAutocomplete,
  SelectTransport,
  Modal,
  Panel,
  WidgetForm,
  InputInteger,
  PageContainer,
  ChatbotStatus,
  SmallTag,
  EditDevice,
  MarkdownViewer,
  UserRecords,
  Maps,
  Breadcrumbs
};

export {
  CollectionEditor,
  HelpElements,
  withConfigurationPage,
  ContentAutocomplete,
  Dictionary,
  Confidence,
  Content,
  JsonEditor,
  TableFilters,
  UserAutocomplete,
  SelectTransport,
  Modal,
  Panel,
  WidgetForm,
  InputInteger,
  PageContainer,
  ChatbotStatus,
  SmallTag,
  EditDevice,
  MarkdownViewer,
  UserRecords,
  Maps,
  Breadcrumbs
};
