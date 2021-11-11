import React from 'react';
import {View, StyleSheet} from 'react-native';

import FileType_none from '../../assets/files/fileType_none.svg';
import FileType_video from '../../assets/files/fileType_video.svg';
import FileType_word from '../../assets/files/fileType_word.svg';
import FileType_ppt from '../../assets/files/fileType_ppt.svg';
import FileType_excel from '../../assets/files/fileType_excel.svg';
import FileType_audio from '../../assets/files/fileType_audio.svg';
import FileType_sheet from '../../assets/files/fileType_sheet.svg';
import FileType_document from '../../assets/files/fileType_document.svg';
import FileType_3d_object from '../../assets/files/fileType_3d_object.svg';
import FileType_vector from '../../assets/files/fileType_vector.svg';
import FileType_database from '../../assets/files/fileType_database.svg';
import FileType_developer from '../../assets/files/fileType_developer.svg';
import FileType_executable from '../../assets/files/fileType_executable.svg';
import FileType_system from '../../assets/files/fileType_system.svg';
import FileType_zip from '../../assets/files/fileType_zip.svg';
import FileType_slides from '../../assets/files/fileType_slides.svg';
import FileType_font from '../../assets/files/fileType_font.svg';
import FileType_pdf from '../../assets/files/fileType_pdf.svg';
import FileType_image from '../../assets/files/fileType_image.svg';
import { emptyArray } from '../../../shared/redux/constants/common.constants';

class FileIcon extends React.Component {
  videoTypes = [];
  googleFormsTypes = [];
  oneNoteTypes = [];
  locationTypes = [];
  devTypes = [];
  msExcel = [];
  msPowerpaint = [];
  msDoc = [];
  compressedTypes = [];
  systemTypes = [];
  fontTypes = [];
  exeTypes = [];
  dbTypes = [];
  spreadTypes = [];
  audioTypes = [];
  docTypes = [];
  presentationTypes = [];
  threeDImgTypes = [];
  rasterImageTypes = [];
  vectorImgTypes = [];
  pdf = 'pdf';

  constructor(props) {
    super(props);
    this.state = {
      type: '',
    };
  }

  componentDidMount() {
    this.loadVideoTypes();
    this.loadGoogleFormsType();
    this.loadOneNoteTypes();
    this.loadLocationTypes();
    this.loadDeveloperTypes();
    this.loadMsoffice();
    this.loadCompressedTypes();
    this.loadSystemTypes();
    this.loadFontTypes();
    this.loadExeTypes();
    this.loadExeTypes();
    this.loadDbFileTypes();
    this.loadSpreadTypes();
    this.loadAudioTypes();
    this.loadDocTypes();
    this.loadPresentationTypes();
    this.loadThreeDImgTypes();
    this.loadRasterImgTypes();
    this.loadVectorImgTypes();

    this.setState({
      type: this.props.type,
    });
  }
  getDrawableByExt = (ext) => {
    let width = this.props?.width || emptyArray;
    let height = this.props?.height || emptyArray;
    if (!ext || ext === '') {
      return <FileType_none />;
    }
    ext = ext.toLowerCase();

    if (this.videoTypes.includes(ext)) {
      return <FileType_video width={width} height={height} />;
    } else if (this.msDoc.includes(ext)) {
      return <FileType_word width={width} height={height} />;
    } else if (this.msPowerpaint.includes(ext)) {
      return <FileType_ppt width={width} height={height} />;
    } else if (this.msExcel.includes(ext)) {
      return <FileType_excel width={width} height={height} />;
    } else if (this.audioTypes.includes(ext)) {
      return <FileType_audio width={width} height={height} />;
    } else if (this.spreadTypes.includes(ext)) {
      return <FileType_sheet width={width} height={height} />;
    } else if (this.docTypes.includes(ext)) {
      return <FileType_document width={width} height={height} />;
    } else if (this.threeDImgTypes.includes(ext)) {
      return <FileType_3d_object width={width} height={height} />;
    } else if (this.rasterImageTypes.includes(ext)) {
      return <FileType_image width={width} height={height} />;
      //return <FileType_raster_image/>//missed
    } else if (this.vectorImgTypes.includes(ext)) {
      return <FileType_vector width={width} height={height} />;
    } else if (this.dbTypes.includes(ext)) {
      return <FileType_database width={width} height={height} />;
    } else if (this.devTypes.includes(ext)) {
      return <FileType_developer width={width} height={height} />;
    } else if (this.exeTypes.includes(ext)) {
      return <FileType_executable width={width} height={height} />;
    } else if (this.systemTypes.includes(ext)) {
      return <FileType_system width={width} height={height} />;
    } else if (this.compressedTypes.includes(ext)) {
      return <FileType_zip width={width} height={height} />;
    } else if (this.presentationTypes.includes(ext)) {
      return <FileType_slides width={width} height={height} />;
    } else if (this.fontTypes.includes(ext)) {
      return <FileType_font width={width} height={height} />;
    } else if (this.pdf === ext) {
      return <FileType_pdf width={width} height={height} />;
    } else if (this.googleFormsTypes.includes(ext)) {
      return <FileType_none />;
      //return <FileType_forms/>//missed  //Google forms
    } else if (this.oneNoteTypes.includes(ext)) {
      return <FileType_none />;
      //return <FileType_one_note/>//miss //One Note
    } else if (this.locationTypes.includes(ext)) {
      return <FileType_none />;
      //return <FileType_location/>//missed //Google locations
    } else {
      return <FileType_none />;
      //return <FileType_file_general/>//missed
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {this.getDrawableByExt(this.state.type)}
      </View>
    );
  }

  loadGoogleFormsType() {
    this.googleFormsTypes.push('gform');
    this.googleFormsTypes.push('gdraw');
  }
  loadOneNoteTypes() {
    this.oneNoteTypes.push('ONE');
    this.oneNoteTypes.push('RNT');
    this.oneNoteTypes.push('TME');
    this.oneNoteTypes.push('B4U');

    this.oneNoteTypes.push('one');
    this.oneNoteTypes.push('rnt');
    this.oneNoteTypes.push('tme');
    this.oneNoteTypes.push('b4u');
  }
  loadLocationTypes() {
    this.locationTypes.push('KMZ');
    this.locationTypes.push('KML');

    this.locationTypes.push('kmz');
    this.locationTypes.push('kml');
  }

  loadDeveloperTypes() {
    this.devTypes.push('c');
    this.devTypes.push('class');
    this.devTypes.push('cpp');
    this.devTypes.push('cs');
    this.devTypes.push('dtd');
    this.devTypes.push('fla');
    this.devTypes.push('h');
    this.devTypes.push('java');
    this.devTypes.push('lua');
    this.devTypes.push('m');
    this.devTypes.push('pl');
    this.devTypes.push('py');
    this.devTypes.push('sh');
    this.devTypes.push('sln');
    this.devTypes.push('swift');
    this.devTypes.push('vb');
    this.devTypes.push('vcxproj');
    this.devTypes.push('xcodeproj');
  }
  loadMsoffice() {
    this.msExcel.push('xls');
    this.msExcel.push('xlsx');
    this.msPowerpaint.push('ppt');
    this.msPowerpaint.push('pptx');
    this.msDoc.push('doc');
    this.msDoc.push('docx');
  }

  loadCompressedTypes() {
    this.compressedTypes.push('7z');
    this.compressedTypes.push('cbr');
    this.compressedTypes.push('deb');
    this.compressedTypes.push('gz');
    this.compressedTypes.push('pkg');
    this.compressedTypes.push('rar');
    this.compressedTypes.push('rpm');
    this.compressedTypes.push('sitx');
    this.compressedTypes.push('tar.gz');
    this.compressedTypes.push('zip');
    this.compressedTypes.push('zipx');
    this.compressedTypes.push('');
  }

  loadSystemTypes() {
    this.systemTypes.push('cab');
    this.systemTypes.push('cpl');
    this.systemTypes.push('cur');
    this.systemTypes.push('deskthemepack');
    this.systemTypes.push('dll');
    this.systemTypes.push('dmp');
    this.systemTypes.push('drv');
    this.systemTypes.push('icns');
    this.systemTypes.push('ico');
    this.systemTypes.push('lnk');
    this.systemTypes.push('sys');
    this.systemTypes.push('cnf');
    this.systemTypes.push('ini');
    this.systemTypes.push('prf');
  }

  loadFontTypes() {
    this.fontTypes.push('fnt');
    this.fontTypes.push('fon');
    this.fontTypes.push('otf');
    this.fontTypes.push('ttf');
  }

  loadExeTypes() {
    this.exeTypes.push('apk');
    this.exeTypes.push('app');
    this.exeTypes.push('bat');
    this.exeTypes.push('cgi');
    this.exeTypes.push('com');
    this.exeTypes.push('exe');
    this.exeTypes.push('gadget');
    this.exeTypes.push('jar');
    this.exeTypes.push('wsf');
  }

  loadDbFileTypes() {
    this.dbTypes.push('db');
    this.dbTypes.push('accdb');
    this.dbTypes.push('dbf');
    this.dbTypes.push('mdb');
    this.dbTypes.push('pdb');
    this.dbTypes.push('sql');
  }

  loadSpreadTypes() {
    this.spreadTypes.push('xlr');

    this.spreadTypes.push('csv');
    this.spreadTypes.push('gsheet');
    this.spreadTypes.push('ods');
  }

  loadAudioTypes() {
    this.audioTypes.push('aif');
    this.audioTypes.push('iff');
    this.audioTypes.push('m3u');
    this.audioTypes.push('m4a');
    this.audioTypes.push('mid');
    this.audioTypes.push('mp3');
    this.audioTypes.push('mpa');
    this.audioTypes.push('wav');
    this.audioTypes.push('wma');
  }

  loadDocTypes() {
    this.docTypes.push('log');
    this.docTypes.push('msg');
    this.docTypes.push('odt');
    this.docTypes.push('pages');
    this.docTypes.push('rtf');
    this.docTypes.push('tex');
    this.docTypes.push('txt');
    this.docTypes.push('wpd');
    this.docTypes.push('wps');
    this.docTypes.push('gdoc');
    this.docTypes.push('document');
  }

  loadPresentationTypes() {
    this.presentationTypes.push('odp');
    this.presentationTypes.push('ged');
    this.presentationTypes.push('key');
    this.presentationTypes.push('pps');
    this.presentationTypes.push('gslide');
  }

  loadThreeDImgTypes() {
    this.threeDImgTypes.push('3dm');
    this.threeDImgTypes.push('3ds');
    this.threeDImgTypes.push('max');
    this.threeDImgTypes.push('obj');
  }

  loadRasterImgTypes() {
    this.rasterImageTypes.push('bmp');
    this.rasterImageTypes.push('dds');
    this.rasterImageTypes.push('gif');
    this.rasterImageTypes.push('heic');
    this.rasterImageTypes.push('jpg');
    this.rasterImageTypes.push('jpeg');
    this.rasterImageTypes.push('png');
    this.rasterImageTypes.push('psd');
    this.rasterImageTypes.push('pspimage');
    this.rasterImageTypes.push('tga');
    this.rasterImageTypes.push('thm');
    this.rasterImageTypes.push('tif');
    this.rasterImageTypes.push('tiff');
    this.rasterImageTypes.push('yuv');
  }

  loadVectorImgTypes() {
    this.vectorImgTypes.push('ai');
    this.vectorImgTypes.push('eps');
    this.vectorImgTypes.push('ps');
    this.vectorImgTypes.push('svg');
  }

  loadVideoTypes() {
    this.videoTypes.push('3g2');
    this.videoTypes.push('3gp');
    this.videoTypes.push('asf');
    this.videoTypes.push('avi');
    this.videoTypes.push('flv');
    this.videoTypes.push('m4v');
    this.videoTypes.push('mov');
    this.videoTypes.push('mp4');
    this.videoTypes.push('mpg');
    this.videoTypes.push('rm');
    this.videoTypes.push('srt');
    this.videoTypes.push('swf');
    this.videoTypes.push('vob');
    this.videoTypes.push('wmv');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor:'white'
  },
});
export default FileIcon;
