const { MSICreator } = require('electron-wix-msi');

const APP_DIR = 'C:\\Users\\gnozom\\WebstormProjects\\Lands-Co-Collector\\dist\\win\\Lands-Co Collector-win32-x64';
const OUT_DIR = 'C:\\Users\\gnozom\\WebstormProjects\\Lands-Co-Collector\\dist\\installer';

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    description: 'Lands-Co Collector',
    exe: 'Lands-Co Collector',
    name: 'Lands-Co Collector',
    defaultInstallMode: 'perUser',
    manufacturer: 'Ma7MOoOD SHaRaF',
    version: '1.0.0',
    appIconPath: 'C:\\Users\\gnozom\\WebstormProjects\\Lands-Co-Collector\\src\\assets\\lands-co.ico',
    programFilesFolderName: "Lands-Co Collector",
    ui: {
        chooseDirectory: true,
    },
});
msiCreator.create().then(function () {
    msiCreator.compile();
});