const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
  // 手动加载本地化文件
  let getLocalizedString;
  try {
    const currentLanguage = vscode.env.language;
    const l10nPath = path.join(__dirname, 'l10n');
    let l10nFile = path.join(l10nPath, `bundle.l10n.${currentLanguage}.json`);

    if (!fs.existsSync(l10nFile)) {
      l10nFile = path.join(l10nPath, 'bundle.l10n.json');
    }

    const l10nData = JSON.parse(fs.readFileSync(l10nFile, 'utf8'));
    getLocalizedString = (key) => {
      return l10nData[key] || key;
    };
  } catch (error) {
    console.error('Failed to load l10n:', error);
    getLocalizedString = (key) => key;
  }

  // 创建状态栏项
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  // 添加文本变化事件监听器
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document === vscode.window.activeTextEditor?.document) {
        updateWordCount(statusBarItem, getLocalizedString);
      }
    })
  );

  // 添加活动编辑器变化事件监听器
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateWordCount(statusBarItem, getLocalizedString);
    })
  );

  // 初始更新
  updateWordCount(statusBarItem, getLocalizedString);
}

function updateWordCount(statusBarItem, getLocalizedString) {
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const text = editor.document.getText();
    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;

    statusBarItem.text = `${wordCount} ${getLocalizedString('status.words')} | ${charCount} ${getLocalizedString('status.chars')}`;
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

module.exports = {
  activate,
  deactivate
}; 