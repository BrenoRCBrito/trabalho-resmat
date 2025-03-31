### Como gerar o executável

```bash
pyinstaller -w -F --add-data "templates;templates" --add-data "static;static" main.py
```