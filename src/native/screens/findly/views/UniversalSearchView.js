import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import ParentView from './ParentView';
import {normalize} from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';

import FileItem from '../singleItem/FileItem';
import EmailItem from '../singleItem/EmailItem';
import {TemplateType} from '../views/TemplateType';
import {BORDER} from './TemplateType';

class UniversalSearchView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.searchPayload;
    this.template_type = this.props.template_type;

    this.setState({
      payload: payload,
    });
  }

  getElementView = (element) => {
    switch (element.type) {
      case 'Email':
        return (
          <View style={{flexDirection: 'column'}}>
            <View style={styles.emails_main_container}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.emails_sub_container}></View>
                <Text style={styles.emails_text}>{element?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (this.props.onViewMoreClick) {
                    this.props.onViewMoreClick(
                      TemplateType.KORA_SEARCH_CAROUSEL,
                      {
                        elements: [
                          {
                            emails: element.elements,
                          },
                          //
                        ],
                      },
                    );
                  }
                }}>
                <Text style={styles.emails_view_more}>
                  {element.elements.length - 1} more
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{padding: 10}}>
              <EmailItem {...this.props} email={element.elements[0]} />
            </View>
          </View>
        );
      case 'Files':
        return (
          <View style={{flexDirection: 'column'}}>
            <View style={styles.files_main_container}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.files_sub_container}></View>
                <Text style={styles.files_text}>{element?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (this.props.onViewMoreClick) {
                    this.props.onViewMoreClick(
                      TemplateType.FILES_SEARCH_CAROUSEL,
                      element,
                    );
                  }
                }}>
                <Text style={styles.emails_view_more}>
                  {element.elements.length - 1} more
                </Text>
              </TouchableOpacity>
            </View>
            {/* {this.getSingleFilesView(element.elements[0])} */}
            <View style={{padding: 15, marginBottom: 5}}>
              <FileItem {...this.props} file={element.elements[0]} />
            </View>
          </View>
        );

      default:
        return (
          <Text
            style={{
              fontSize: normalize(14),
              color: 'black',
              fontWeight: '400',
              fontFamily: Constants.fontFamily,
            }}>
            ---- {element?.type} template pending ----
          </Text>
        );
    }
  };

  renderUniversalSearchView = () => {
    if (
      !this.state.payload ||
      !this.state.payload.elements ||
      this.state.payload.elements.length <= 0
    ) {
      return null;
    }

    const elements = this.state.payload.elements;
    let index = 0;
    return (
      <View style={styles.main_container}>
        {elements.map((element) => {
          index++;
          return (
            <View key={index} style={styles.sub_container}>
              {this.getElementView(element)}
            </View>
          );
        })}
      </View>
    );
  };

  render() {
    return this.renderUniversalSearchView();
  }
}

const styles = StyleSheet.create({
  files_text: {
    fontSize: BORDER.TEXT_SIZE,
    color: 'black',
    fontWeight: '500',
    fontFamily: Constants.fontFamily,
  },
  files_sub_container: {
    backgroundColor: 'green',
    borderRadius: 10 / 2,
    height: 6,
    marginEnd: 6,
    width: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  files_main_container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
  emails_view_more: {
    fontSize: normalize(15),
    color: 'black',
    fontWeight: '500',
    fontFamily: Constants.fontFamily,
  },
  emails_text: {
    fontSize: normalize(17),
    color: 'black',
    fontWeight: '500',
    fontFamily: Constants.fontFamily,
  },
  emails_sub_container: {
    backgroundColor: 'green',
    borderRadius: 10 / 2,
    height: 6,
    marginEnd: 6,
    width: 6,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  main_container: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: BORDER.RADIUS,
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
  },
  sub_container: {
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  emails_main_container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 5,
  },
});

export default UniversalSearchView;
