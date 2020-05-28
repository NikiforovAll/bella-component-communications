# Bella Component Communication

Bella is domain specific programming language developed and maintained internally by HYS-Enterprise. The goal of this programming language is to provide business rule engine based on Service Oriented Architecture (SOA) approach. Bella solution is transpiled to C# + WCF + RBMQ (wrapped to work with WCF)

Diagrams and tooling is based on export from Bella Language Server Implementation for Bella programming language.

Bella language support repository (https://github.com/NikiforovAll/bella-language-support) was developed by @NikiforovAll to provide first-class IDE support for Bella.

This solutions contains multiple folders:

* bella-language-server - vscode-extension: highlighting grammar + language server
* bella-language-server/server - csharp implementation of LSP
* bella-tmLanguage - tmLanguage highlighting for Bella
* bella-grammars - bella grammar written in antlr4 and packaged as typescript module
* bella-generator - code generator/scaffolder for bella



![image](https://user-images.githubusercontent.com/8037439/83200718-9d7ca700-a14c-11ea-89ee-705f9b31a0f1.png)

![image](https://user-images.githubusercontent.com/8037439/83201127-838f9400-a14d-11ea-8705-917b855c455b.png)

![image](https://user-images.githubusercontent.com/8037439/83201212-b043ab80-a14d-11ea-9ee8-76f3dee3f15b.png)

