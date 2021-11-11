import {Player} from '@react-native-community/audio-toolkit';

export class AudioPlayer {
  player = Player || null;
  playerCB = null;
  lastSeek = 0;
  _progressInterval = null;
  _recordingMSInterval = 0;
  mediaUrl = '';

  setPlayerCallBack = (percentage = 0) => {
    if (this.isPlayingAudio()) {
      this.seek(percentage);
    }
  };

  _reloadPlayer(mediaUrl, playerCB = null) {
    this.playerCB = playerCB;
    this.mediaUrl = mediaUrl;

    //this.filename = 'voice_record_' + this.getUID() + '.aac';

    if (mediaUrl) {
      if (this.player) {
        clearInterval(this._progressInterval);
        if (this.player.getFilePath !== mediaUrl) {
          //  this.stop();
        }
      }
      this.player = new Player(mediaUrl, {
        autoDestroy: false,
      }).prepare((err) => {
        if (err) {
          console.log('error at _reloadPlayer():');
          console.log(err);
        } else {
          //console.log('this.player ------------->>:', this.player);
          //  setTimeout(() => {
          this.play();
          // }, 100);
          // this.player.looping = this.state.loopButtonStatus;
        }

        //  this._updateState();
      });

      if (this.playerCB) {
        this.playerCB('loading', 0, 0);
      }

      this.player?.on('ended', () => {
        this._updateState();
      });
      this.player?.on('pause', () => {
        this._updateState();
      });
    }
  }
  getFilePath = () => {
    return this.mediaUrl; //this.player?._path || null;
  };
  _shouldUpdateProgressBar() {
    // Debounce progress bar update by 200 ms
    return Date.now() - this.lastSeek > 100;
  }
  isPlayingAudio = () => {
    return this.player?.isPlaying;
  };

  pauseAudio = () => {
    if (this.player?.isPlaying) {
      this.pause();
    }
  };

  play() {
    // this.player = new Player(this.props.mediaUrl);
    this.player?.play(() => {
      // this.setState({isplaying: true});
      this._updateState();
    });
    clearInterval(this._progressInterval);
    this._progressInterval = setInterval(() => {
      if (
        this.playerCB &&
        this.player &&
        this.isPlayingAudio() &&
        this._shouldUpdateProgressBar()
      ) {
        let currentProgress =
          Math.max(0, this.player.currentTime) / this.player.duration;
        if (isNaN(currentProgress)) {
          currentProgress = 0;
        }

        currentProgress =
          Math.round((currentProgress + Number.EPSILON) * 1000) / 1000;

        // console.log('currentProgress ----->:', currentProgress);
        //console.log('currentTime ----->:', this.player.currentTime);
        this.playerCB(
          'default',
          false,
          currentProgress,
          this.player.currentTime,
          this.player.duration,
        );
      }
    }, 100);
  }

  updatePlayerUI = () => {
    let currentProgress =
      Math.max(0, this.player.currentTime) / this.player.duration;
    if (isNaN(currentProgress)) {
      currentProgress = 0;
    }

    currentProgress =
      Math.round((currentProgress + Number.EPSILON) * 1000) / 1000;

    // console.log('currentProgress ----->:', currentProgress);
    //console.log('currentTime ----->:', this.player.currentTime);
    this.playerCB(
      'default',
      false,
      currentProgress,
      this.player.currentTime,
      this.player.duration,
    );
  };

  pause() {
    this.player?.pause(() => {
      // this.setState({isplaying: false});
      this._updateState();
    });
  }

  stop() {
    if (this.player && this.player.canStop) {
      clearInterval(this._progressInterval);
      this.player?.stop(() => {
        // this.player.seek(0);
        // console.log('Stopped');
        if (this.playerCB) {
          //  let btnState = 'Play';
          //  this.playerCB(btnState, false, 0, 0);
          // this._updateState();

          this.playerCB('Play', false, 0, 0, this.player.duration);
        }
      });
    }
  }
  destroy() {
    if (this.player && this.player.isPrepared) {
      this.player?.destroy(() => {
        // console.log('Destroyed');
      });
    }
  }
  _playPause() {
    this.player?.playPause((err, paused) => {
      this._updateState();
      if (!paused) {
        // this._recordingMSInterval = setInterval(() => {
        //   // this.setState({
        //   //   duration: this.player?.duration,
        //   // });
        // }, 50);
        // setTimeout(() => {
        //   clearInterval(this._recordingMSInterval);
        // }, this.player?.duration + 500);
      }
      if (err) {
        // this.setState({
        //   error: err.message,
        // });
      }
    });
    //this._updateState();
  }
  _updateState() {
    if (this.playerCB) {
      let btnState = this.player?.isPlaying ? 'Pause' : 'Play';

      let currentProgress =
        Math.max(0, this.player.currentTime) / this.player.duration;
      if (isNaN(currentProgress)) {
        currentProgress = 0;
      }

      currentProgress =
        Math.round((currentProgress + Number.EPSILON) * 1000) / 1000;

      // console.log('currentProgress ----->:', currentProgress);
      //console.log('currentTime ----->:', this.player.currentTime);
      this.playerCB(
        btnState,
        this.player?.isPlaying,
        currentProgress,
        this.player.currentTime,
        this.player.duration,
      );

      // this.playerCB(
      //   btnState,
      //   this.player?.isPlaying,
      //   this.player?.currentTime || 0,
      //   this.player?.duration,
      // );
    }
    return;

    // this.playerCB(
    //   btnState,
    //   this.player?.isPlaying,
    //   this.player?.currentTime || 0,
    //   this.player?.duration,
    // );
  }

  seek(percentage) {
    if (!this.player) {
      return;
    }

    this.lastSeek = Date.now();

    let position = percentage * this.player?.duration;

    this.player?.seek(position, () => {
      // console.log('Seek');
    });
  }

  millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
      (minutes < 10 ? '0' : '') +
      minutes +
      ':' +
      (seconds < 10 ? '0' : '') +
      seconds
    );
  }
  _seek(percentage) {
    if (!this.player) {
      return;
    }

    this.lastSeek = Date.now();

    let position = percentage * this.player?.duration;

    this.player?.seek(position, () => {
      //this._updateState();
    });
  }

  navigationLong() {
    if (this.props?.onLongClickMedia) {
      this.props?.onLongClickMedia();
    }
  }

  navigation() {
    if (this.props.mediaUrl) {
      if (this.player) {
        this._playPause();
      } else {
        this._reloadPlayer();
      }
    } else if (this.props?.particularMediaClick) {
      let componentID = this.props.components[0].componentId;
      this.props?.particularMediaClick(componentID);
      // this.setState({
      //   isLoading: true,
      // });
    }
  }
}
