# 高岛易断

高岛易断是一个基于周易的算卦工具，可以根据手相数字测算卦象并提供详细解析。

## 功能介绍

- 基于性别和手相数字计算卦象
- 提供完整的64卦象详细解析
- 包含传统解释和现代解读
- 支持动爻解释

## 使用方法

1. 选择性别（男性和女性对应的手相计算方式不同）
2. 输入手相数字
   - 男性：左手为上卦，右手为下卦
   - 女性：右手为上卦，左手为下卦
3. 输入动爻数字
4. 点击"计算卦象"按钮获取结果
5. 点击"查看卦象详解"查看完整解释

## 技术说明

- 使用原生JavaScript开发
- 支持Chrome浏览器扩展
- 数据存储采用JSON格式
- 图片采用统一命名规则

## 安装方法

### 浏览器扩展安装方式

1. 下载源代码
2. 打开Chrome浏览器，进入扩展管理页面：chrome://extensions/
3. 开启"开发者模式"
4. 点击"加载已解压的扩展"，选择项目文件夹
5. 扩展将被安装到Chrome浏览器中

## 数据来源

本应用中的卦象解释综合了多种传统易经解析资料，包括周易原文、坎特伯雷周易、高岛易断等。

## 改进计划

- [ ] 添加更多卦象图片资源
- [ ] 优化动爻解释内容
- [ ] 提供更详细的现代解读
- [ ] 支持卦象收藏功能

## 贡献指南

如果您想为此项目做出贡献，请遵循以下步骤：

1. Fork本仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 版本更新

### 版本1.0.4
- 将二维码收款图片替换为外部打赏链接，符合应用商店规范
- 限制输入范围：上卦和下卦只能输入1-8，动爻只能输入1-6
- 添加卦序显示功能，明确展示当前卦是64卦中的第几卦
- 优化计算逻辑，直接使用输入数值而不再进行取模运算
- 清理项目资源，移除不必要的图片文件
- 优化UI界面，提升用户体验

### 版本1.0.3
- 新增爻辞数据库，整合了所有64卦全部384爻的爻辞名称
- 优化动爻显示，现在能够准确显示每个卦的正确爻辞名
- 增加了浏览模式下的爻辞预览，直接显示当前卦象的所有六爻
- 添加爻位标题点击高亮/取消高亮功能，方便查看不同爻的解释内容
- 增强数据处理逻辑，正确识别和提取卦名信息
- 所有HTML页面均已更新，添加了对爻辞数据库的引用

### 版本1.0.2
- 修复了其他卦象无法显示的问题
- 优化了资源加载逻辑，使用chrome.runtime.getURL确保正确获取扩展资源
- 增强了图片加载错误处理，添加多种备选路径自动尝试
- 添加动爻自动高亮和滚动定位功能
- 优化了页面加载体验，添加成功提示
- 为所有64个卦象详情页添加了必要的CSS和JS引用

### 版本1.0.1
- 优化了详情页功能：移除了content_scripts配置，改为在HTML详情页中直接引入JS和CSS文件
- 修复了详情页中无法显示动爻信息的问题
- 改进了localStorage数据存储，使用统一前缀
- 增强了错误处理，提供更友好的错误提示
- 增加了悬浮框关闭状态记忆功能
