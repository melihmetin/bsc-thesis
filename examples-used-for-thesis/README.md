To run the version of the thesis. You need to  run 2 terminals.

First Terminal:
cd flint-to-eflint\
uvicorn service.app:app --host 0.0.0.0 --port 8000

Second Terminal:
cd gui
netlify dev

In a third terminal, you can run the Haskell-implementation of eFLINT to execute eflint files.