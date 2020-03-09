import * as React from 'react';
import { Icon } from './Icon';
import {PipelineList} from './pipelines/PipelineList';
import PipelineModal from './pipelines/PipelineModal';

const assets = require('../util/assets');


export class PipelinesSidebar extends React.PureComponent<{}, {modalIsOpen: boolean}> {
  constructor(props) {
    super(props);
    this.state = {modalIsOpen: false};
  }

  private openModal = () => this.setState({modalIsOpen: true})
  private closeModal = () => this.setState({modalIsOpen: false})

  public render() {
    return (
      <div className='sidebar' id='pipeline-sidebar'>
        <h2>Data Pipelines
          <span className='new' onClick={this.openModal}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <PipelineList openModal={this.openModal} />

        <PipelineModal modalIsOpen={this.state.modalIsOpen}
          closeModal={this.closeModal} />
      </div>
    );
  }
}
