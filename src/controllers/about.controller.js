const {remote} = require('electron');

function closeAboutWindow() {
    remote.getCurrentWindow().close();
}