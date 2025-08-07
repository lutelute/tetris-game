# テトリス

JavaScript版とPython版のテトリスゲームです。

## JavaScript版

### 遊び方
1. ブラウザで `index.html` を開く
2. 矢印キーで操作
   - ← → : 移動
   - ↓ : 落下速度アップ
   - ↑ : 回転
   - スペース : ハードドロップ

## Python版

### 実行方法
1. 仮想環境を作成・有効化
   ```
   python3 -m venv tetris_env
   source tetris_env/bin/activate  # macOS/Linux
   # または tetris_env\Scripts\activate  # Windows
   ```
2. 必要なパッケージをインストール
   ```
   pip install -r requirements.txt
   ```
3. ゲームを実行
   ```
   python tetris.py
   ```

### 操作方法
- ← → : 移動
- ↓ : 落下速度アップ
- ↑ : 回転
- スペース : ハードドロップ

## ファイル構成
- `index.html` - JavaScript版のメインHTML
- `tetris.js` - JavaScript版のゲームロジック
- `tetris.py` - Python版のゲーム
- `requirements.txt` - Python版の依存関係