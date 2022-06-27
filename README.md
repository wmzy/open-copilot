# CodeGen plugin for vscode

+ 1.安装vsce，一个vscode插件打包工具
```bash
npm install -g vsce
```
+ 2.打包vsce插件
```bash
vsce package
```
+ 3.安装code-insiders

+ 4.打开vscode命令行启动权限
[参考](https://blog.csdn.net/flitrue/article/details/90906578)

+ 5.启动vscode
```bash
code-insiders --enable-proposed-api lowinli.codegen
```
