# MQTT 救星 #
使用 electron + typescript + react 撰寫。

全面升級你的 MQTT + json/protobuf 體驗

## 啟動方式 ##
### 從原始碼啟動 ###
```sh
npm i
npm start     # 正常啟動
npm run debug # 開啟開發者視窗
```
### 打包 ###
```sh
npm run pack     # linux 版
npm run pack-win # windows 版
```
生成的執行檔將存放於 `package/mq-savior-*` 中。

## 設定檔管理 ##
所有設定應存放於 `configs/` 資料夾中，不會進入版本控制。

讀取設定檔時，會從執行檔/原始碼的位置遞迴向上尋找包含 `configs/` 的資料夾，找到該資料夾後便認定其為專案根目錄（類似 .git 的運作方式）。設定檔中如欲使用相對路徑，請以專案根目錄為基準。

具體作法請見 `configs/config.example.json`。

> 需注意：執行打包程式後，設定檔也會複製一份至打包後的目錄（`package/mq-savior-*/configs`），因此修改專案設定檔 __不會__ 影響發行環境的設定。
> 如此一來，開發環境與發行環境便不會互相汙染。

## 熱鍵表 ##
* `F1~F7` 切分頁
* `Ctrl+Up/Ctrl+Down` 切主題
* `Ctrl+X` 展開/收起文字框
* `Ctrl+P` 發送訊息（不論選擇主題為何，只發送當前展開文字方塊的主題）

## 待做 ##
* 暫時靜音某個頻道？
* 未讀訊息提示
* MQTT wildcard 監聽
