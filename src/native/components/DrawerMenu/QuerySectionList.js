import React from 'react';
import withObservables from '@nozbe/with-observables';
import {Q} from '@nozbe/watermelondb';
import database from '../../realm';

import QuerySectionListItem from './QuerySectionListItem';
import * as Entity from '../../realm/dbconstants';

class QuerySectionList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {queryItems, handlePress, menuSelectedState} = this.props;
    return queryItems?.map((queryItem) => {
      return (
        <QuerySectionListItem
          handlePress={handlePress}
          key={queryItem.id}
          menuSelectedState={menuSelectedState}
          queryItem={queryItem}
        />
      );
    });
  }
}

const enhance = withObservables([], () => ({
  queryItems: database.active.collections
    .get(Entity.QueryItems)
    .query(Q.where('active', Q.eq(true))),
}));

export default enhance(QuerySectionList);
