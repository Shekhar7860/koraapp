import React from 'react';
import PropTypes from 'prop-types';


class ParentView extends React.Component {
    constructor(props) {
        super(props);
    }
    isViewDisabled = () => {
        return false;//this.props.isDisable ? this.props.isDisable : false;
    }


}

ParentView.defaultProps = {
    onClick: () => { },
    onViewMoreClick: () => { },
    onListItemClick: () => { },
    callGoBack: () => { },
};

ParentView.propTypes = {
    onClick: PropTypes.func,
    onViewMoreClick: PropTypes.func,
    onListItemClick: PropTypes.func,
    callGoBack: PropTypes.func,
};

export default ParentView;
