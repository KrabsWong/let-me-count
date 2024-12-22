const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

let statusBarItem;

function activate(context) {
  // 手动加载本地化文件
  try {
    const currentLanguage = vscode.env.language;
    const l10nPath = path.join(__dirname, 'l10n');
    let l10nFile = path.join(l10nPath, `bundle.l10n.${currentLanguage}.json`);

    if (!fs.existsSync(l10nFile)) {
      l10nFile = path.join(l10nPath, 'bundle.l10n.json');
    }

    const l10nData = JSON.parse(fs.readFileSync(l10nFile, 'utf8'));
    global.getLocalizedString = (key) => {
      return l10nData[key] || key;
    };
  } catch (error) {
    console.error('Failed to load l10n:', error);
  }

  // 创建状态栏项
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  // 更新计数的函数
  function updateWordCount() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      statusBarItem.hide();
      return;
    }

    const text = editor.document.getText();

    // 计算总字符数（包括空格和换行符）
    const totalChars = text.length;

    // 计算单词数（对于英文）或字符数（对于中文）
    let wordCount = 0;

    // 使用正则表达式匹配中文字符和英文单词
    const matches = text.match(/[\u4e00-\u9fa5]|[a-zA-Z]+/g);
    if (matches) {
      wordCount = matches.length;
    }

    // 获取本地化的标签文本
    const charsLabel = getLocalizedString('status.chars');
    const wordsLabel = getLocalizedString('status.words');

    // 更新状态栏
    statusBarItem.text = `${charsLabel}: ${totalChars} | ${wordsLabel}: ${wordCount}`;
    statusBarItem.show();
  }

  // 注册命令
  let disposable = vscode.commands.registerCommand('word-counter.refresh', () => {
    updateWordCount();
  });
  context.subscriptions.push(disposable);

  // 监听文本编辑器变化
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateWordCount();
    })
  );

  // 监听文档变化
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document === vscode.window.activeTextEditor?.document) {
        updateWordCount();
      }
    })
  );

  // 初始更新
  updateWordCount();
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