const vscode = require('vscode')

const PACKAGE_NAME = 'auto-posthtml'
const posthtml = require('posthtml')
let config = {}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    await readConfig()

    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(PACKAGE_NAME)) {
            await readConfig()
        }
    })

    context.subscriptions.push(
        vscode.commands.registerCommand('autopos.format', async () => {

            const activeEditor = vscode.window.activeTextEditor
            let doc = activeEditor?.document
            let html = doc.getText()
            let ws = vscode.workspace.workspaceFolders[0]?.uri.fsPath

            let fav = {
                ...config.favIcon,
                outDir       : `${ws}/${config.favIcon.outDir}`,
                configuration: {
                    ...config.favIcon.configuration,
                    path: `${ws}/${config.favIcon.configuration.path}`
                }
            }

            let res = await posthtml([
                require('posthtml-aria-tabs')(),
                require('posthtml-schemas')(config.schemas),
                require('posthtml-alt-always')(),
                require('posthtml-remove-duplicates')(config.removeDuplicates),
                require('posthtml-lazyload')(config.lazyLoad),
                require('posthtml-link-noreferrer')({attr: config.noReferrer}),
                require('posthtml-favicons')(fav)
            ]).process(html)

            return activeEditor.edit(
                (edit) => edit.replace(
                    new vscode.Range(0, 0, doc.lineCount, 0),
                    res.html
                ),
                {undoStopBefore: false, undoStopAfter: false}
            )
        })
    )
}

async function readConfig() {
    return config = await vscode.workspace.getConfiguration(PACKAGE_NAME)
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
