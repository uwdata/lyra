import * as React from 'react';
import * as ReactModal from 'react-modal';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';

const getIn = require('../../util/immutable-utils').getIn;
const WActions = require('../../actions/walkthroughActions');
const assets = require('../../util/assets');
const Icon = require('../Icon');

interface StateProps {
  walkthroughs: any;
}

interface DispatchProps {
  select: (key: any) => void;
}

interface OwnState {
  modalIsOpen: boolean;
}

function mapStateToProps(reduxState: State): StateProps {
  return {
    walkthroughs: getIn(reduxState, 'walkthrough.data')
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
  return {
    select: function(key) {
      dispatch(WActions.setActiveWalkthrough(key));
    }
  };
}

class WalkthroughMenu extends React.Component<StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: false
    };
  };

  public selectWalkthrough(key) {
    this.props.select(key);
    this.closeModal();
  }

  public openModal() {
    this.setState({modalIsOpen: true});
  }

  public closeModal() {
    this.setState({modalIsOpen: false});
  }

  public getWalkthroughDetails() {
    const walkD = this.props.walkthroughs.toJS();
    const walkthroughs = [];
    for (const key in walkD) {
      walkD[key].key = key;
      walkthroughs.push(walkD[key]);
    }
    return walkthroughs;
  }

  private classNames = 'hints walkthroughMenu ';

  public render() {
    return (
      <div>
        <a onClick={this.openModal}>Walkthroughs</a>
        <ReactModal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
            <div className ='wrapper walkthrough-menu'>
              <span className='closeModal' onClick={this.closeModal}>
                <Icon glyph={assets.close} />
              </span>
              <h2 className='hed'>Select a walkthrough</h2>
              <p>
                Learn to use lyra with step by step guides.
                You can quit them at any time to explore on your own.
              </p>
              <ul>
                {this.getWalkthroughDetails().map(function(wk, i) {
                  const thumbnail = wk.image ? (<img src={wk.image}/>) : null;
                  return (
                    <li key={i} onClick={this.selectWalkthrough.bind(this, wk.key)}>
                      {thumbnail}
                      <span>{wk.title}</span>
                    </li>
                  );
                }, this)}
              </ul>
            </div>
          </ReactModal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalkthroughMenu);
