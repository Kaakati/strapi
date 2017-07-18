/*
 *
 * Home
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { findKey, includes } from 'lodash';

import Helmet from 'react-helmet';
import { router } from 'app';

// design
import ContentHeader from 'components/ContentHeader';
import EditForm from 'components/EditForm';

import { makeSelectSections } from 'containers/App/selectors';
import selectHome from './selectors';
import { configFetch } from './actions'
import styles from './styles.scss';
import config from './config.json';

export class Home extends React.Component { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);
    this.customComponents = config.customComponents;
    this.components = {
      editForm: EditForm,
    };
  }

  componentDidMount() {
    if (this.props.params.slug) {
      const apiUrl = this.props.params.env ? `${this.props.params.slug}/${this.props.params.env}` : this.props.params.slug;
      this.props.configFetch(apiUrl);
    } else {
      router.push(`/plugins/settings-manager/${this.props.sections[0].items[0].slug}`);
    }
  }


  componentWillReceiveProps(nextProps) {
    // check if params slug updated
    if (this.props.params.slug !== nextProps.params.slug) {
      if (nextProps.params.slug) {
        // get data from api if params slug updated
        const apiUrl = nextProps.params.env ? `${nextProps.params.slug}/${nextProps.params.env}` : nextProps.params.slug;
        this.props.configFetch(apiUrl);
      } else {
        // redirect user if no params slug provided
        router.push(`/plugins/settings-manager/${this.props.sections[0].items[0].slug}`);
      }
    } else if (this.props.params.env !== nextProps.params.env && nextProps.params.env) {
      // get data if params env updated
      this.props.configFetch(`${this.props.params.slug}/${nextProps.params.env}`);
    }

  }

  handleChange = ({ target }) => {
    console.log(target);
  }

  render() {
    if (this.props.home.loading) {
      return <div />;
    }

    // check if  settingName (params.slug) has a custon view display
    const component = findKey(this.customComponents, (value) => includes(value, this.props.params.slug)) ?
      findKey(this.customComponents, (value) => includes(value, this.props.params.slug)) : 'div'; // TODO change div to defaultComponent
    // if custom view display render specificComponent
    const Form = this.components[component];
    return (
      <div className={`${styles.home} col-md-9`}>
        <Helmet
          title="Home"
          meta={[
            { name: 'description', content: 'Description of Home' },
          ]}
        />
        <ContentHeader
          name={this.props.home.configsDisplay.name}
          description={this.props.home.configsDisplay.description}
        />
        <Form sections={this.props.home.configsDisplay.sections} handleChange={this.handleChange} />
      </div>
    );
  }
}


const mapStateToProps = createStructuredSelector({
  home: selectHome(),
  sections: makeSelectSections(),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      configFetch,
    },
    dispatch
  )
}

Home.propTypes = {
  configFetch: React.PropTypes.func.isRequired,
  home: React.PropTypes.object,
  params: React.PropTypes.object.isRequired,
  sections: React.PropTypes.array,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
