set -e

sys="unkown"
if [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    sys="linux"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
    sys="win32"
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    sys="win32"
fi

npx tsc
npx webpack -p
npx electron-packager . mq-savior --overwrite --platform=$sys --arch=x64 --asar --out package/tmp --ignore configs
cp package/tmp/mq-savior-$sys-x64/* package/mq-savior-$sys-x64 -R
cp ./configs package/mq-savior-$sys-x64 -Rn