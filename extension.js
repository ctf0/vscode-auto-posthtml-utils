const vscode = require('vscode')
const posthtml = require('posthtml')

const PACKAGE_NAME = 'autoPosthtml'
let config = {}
let fileTypes = []
let enabledPlugins = []

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
                let arr = []

                for (const item of enabledPlugins) {
                    switch (item) {
                        case 'altAlways':
                            arr.push(require('posthtml-alt-always')())
                            break

                        case 'ariaTabs':
                            arr.push(require('posthtml-aria-tabs')())
                            break

                        case 'schemes':
                            arr.push(require('posthtml-schemas')(config.schemas))
                            break

                        case 'removeDuplicates':
                            arr.push(require('posthtml-remove-duplicates')(config.removeDuplicates))
                            break

                        case 'lazyLoad':
                            arr.push(require('posthtml-lazyload')(config.lazyLoad))
                            break

                        case 'noReferrer':
                            arr.push(require('posthtml-link-noreferrer')({attr: config.noReferrer}))
                            break

                        case 'attrSort':
                            arr.push(require('posthtml-attrs-sorter')({order: config.attrSort}))
                            break
                    }
                }

                let res = await posthtml(arr).process(html)

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

    let plugins = config.togglePlugins
    enabledPlugins = Object.keys(plugins).filter((item) => plugins[item])
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
