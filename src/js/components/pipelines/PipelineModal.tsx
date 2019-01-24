import {RecordOf} from 'immutable';
import * as React from 'react';
import * as ReactModal from 'react-modal';
import { connect } from 'react-redux';
import {State} from '../../store';
import {LyraPipeline} from '../../store/factory/Pipeline';
import DataTable from './DataTable';
import DataURL from './DataURL';
import RawValuesTextArea from './RawValuesTextArea';

const dl = require('datalib');
const addPipeline = require('../../actions/pipelineActions').addPipeline;
const exampleDatasets = require('../../constants/exampleDatasets');
const dsUtils = require('../../util/dataset-utils');
const NAME_REGEX = dsUtils.NAME_REGEX;

interface OwnProps {
  closeModal: () => void;
  modalIsOpen: boolean;
}

interface DispatchProps {
  addPipeline: (pipeline: RecordOf<LyraPipeline>, dataset: any, values: any, schema: any) => void;
}

export interface PipelineModalState {
    error: string;
    success: any;
    showPreview: boolean;
    selectedExample: string;

    pipeline: RecordOf<LyraPipeline>;
    dataset: any;
    values: any;
    schema: any;
}

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps: OwnProps): DispatchProps {
  return {
    addPipeline: function(pipeline, dataset, values, schema) {
      dispatch(addPipeline(pipeline, dataset, values, schema));
    }
  };
}

export class PipelineModal extends React.Component<OwnProps & DispatchProps, PipelineModalState> {

  private initialState = {
    error: null,
    success: null,
    showPreview: false,
    selectedExample: null,

    pipeline: null,
    dataset: null,
    values: null,
    schema: null,
  };

  constructor(props) {
    super(props);

    this.state = this.initialState;
  }

  public success(state: Partial<PipelineModalState>, msg: string | boolean, preview) {
    this.setState(dl.extend({
      error: null,
      success: msg || null,
      showPreview: !(preview === false),
      selectedExample: null
    }, state));
  }

  public error(err) {
    this.setState({
      error: err.statusText || err.message || 'An error occured!',
      success: null,
      selectedExample: null
    });
  }

  public done(save) {
    const state = this.state;
    if (save && state.error === null) {
      this.props.addPipeline(state.pipeline, state.dataset,
        state.values, state.schema);
    }

    this.setState(this.initialState);
    this.props.closeModal();
  }

  public loadURL(msg: string | boolean, url: string) {
    const that = this;
    msg = msg !== false ?
      'Successfully imported ' + url.match(NAME_REGEX)[0] + '!' : msg;

    dsUtils.loadURL(url)
      .then(function(loaded) {
        const dataset = loaded.dataset;
        const parsed = dsUtils.parseRaw(loaded.data);
        const values = parsed.values;

        that.success({
          pipeline: loaded.pipeline,
          dataset: (dataset.format = parsed.format, dataset),
          values: values,
          schema: dsUtils.schema(values),
          selectedExample: url
        }, msg, true);
      })
      .catch(function(err) {
        that.error(err);
      });
  }

  public render() {
    const props = this.props;
    const state = this.state;
    const error = state.error;
    const success = state.success;
    const preview = state.showPreview;
    const close = this.done.bind(this, false);

    const style = {
      overlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      content: {
        // position: null,
        overflow: 'hidden',
        top: null, bottom: null, left: null, right: null,
        width: '550px',
        height: (success || error || preview) ? 'auto' : '300px',
        padding: null
      }
    };

    return (
      <ReactModal isOpen={props.modalIsOpen} onRequestClose={close}
        style={style}>
        <div className='pipelineModal'>
          <span className='closeModal' onClick={close}>close</span>

          <div className='examples'>
            <h2>Example Datasets</h2>

            <ul>
              {exampleDatasets.map(function(example) {
                const name = example.name;
                const description = example.description;
                const url = example.url;
                const className = state.selectedExample === url ? 'selected' : null;

                return (
                  <li key={name} onClick={this.loadURL.bind(this, false, url)}
                    className={className}>
                    <p className='example-name'>{name}</p>
                    <p>{description}</p>
                  </li>
                );
              }, this)}
            </ul>
          </div>

          <div className='load'>
            <h2>Import a Dataset</h2>

            <p>
              Data must be in a tabular form. Supported import
              formats include <abbr title='JavaScript Object Notation'>json</abbr>, <abbr title='Comma-Separated Values'>csv</abbr> and <abbr title='Tab-Separated Values'>tsv</abbr>
            </p>

            <DataURL loadURL={this.loadURL.bind(this, true)} />
            <RawValuesTextArea success={this.success} error={this.error} />
          </div>

          {error ? <div className='error-message'>{error}</div> : null}
          {success ? <div className='success-message'>{success}</div> : null}

          {!preview || error ? null : (
            <div className='preview'>
              <h2>Preview</h2>

              {/* <DataTable className='source' TODO(jzong): check if className was getting read*/ }
              <DataTable
                values={state.values} schema={state.schema} />

              <button className='button button-success'
                onClick={this.done.bind(this, true)}>
                Import
              </button>
            </div>
          )}
        </div>
      </ReactModal>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PipelineModal);
