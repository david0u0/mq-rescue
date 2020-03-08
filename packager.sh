npx electron-packager . mq-savior --overwrite --platform=$1 --arch=x64 --asar --out package --ignore configs\
&& cp ./configs package/mq-savior-$1-x64 -R