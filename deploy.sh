#!/bin/bash
cp -r ../movement-gadgets/* .
git commit -a --amend --no-edit
git push -f
