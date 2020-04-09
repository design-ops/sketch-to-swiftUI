#!/usr/bin/env bash

if [[ $(command -v brew) == "" ]]; then
    echo "Installing Homebrew"
    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else

if [[ $(command -v fonttools) == "" ]]; then
    echo "Installing fonttools"
    brew install fonttools
else
