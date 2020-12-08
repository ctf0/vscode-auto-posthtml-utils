const vscode = require('vscode')
const posthtml = require('posthtml')

const PACKAGE_NAME = 'autoPosthtml'
let config = {}
let fileTypes = []

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
        vscode.commands.registerCommand('aph.format', async () => {

            const activeEditor = vscode.window.activeTextEditor
            let doc = activeEditor?.document

            if (fileTypes.some((e) => e == doc.languageId)) {
                let html = doc.getText()
                let ws = vscode.workspace.workspaceFolders[0]?.uri.fsPath

                let res = await posthtml([
                    require('posthtml-aria-tabs')(),
                    require('posthtml-schemas')(config.schemas),
                    require('posthtml-alt-always')(),
                    require('posthtml-remove-duplicates')(config.removeDuplicates),
                    require('posthtml-lazyload')(config.lazyLoad),
                    require('posthtml-link-noreferrer')({attr: config.noReferrer}),
                    require('posthtml-attrs-sorter')({order: config.attrSort})
                ]).process(html)

                return activeEditor.edit(
                    (edit) => edit.replace(
                        new vscode.Range(0, 0, doc.lineCount, 0),
                        res.html
                    ),
                    {undoStopBefore: false, undoStopAfter: false}
                )
            } else {
                return vscode.window.showWarningMessage(`Auto Posthtml: sorry, only a file type of "${fileTypes.join(', ')}"`)
            }
        })
    )
}

async function readConfig() {
    config = await vscode.workspace.getConfiguration(PACKAGE_NAME)
    fileTypes = config.fileTypes
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
