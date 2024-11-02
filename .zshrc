# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi
# Lines configured by zsh-newuser-install

# Set default editors
# export EDITOR=vim
export VISUAL="/usr/bin/code"

# Bash history
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
bindkey -e

codeDir=/home/samuli/Documents/scripts
colorizeLocation=$codeDir/colorize.py

# Use lf to switch directories and bind it to ctrl-o
lfcd () {
     tmp="$(mktemp -uq)"
     trap 'rm -f $tmp >/dev/null 2>&1' HUP INT QUIT TERM PWR EXIT
     lf -last-dir-path="$tmp" "$@"
     if [ -f "$tmp" ]; then
     	dir="$(cat "$tmp")"
     	[ -d "$dir" ] && [ "$dir" != "$(pwd)" ] && cd "$dir"
     fi
}
bindkey -s '^o' '^ulfcd\n'

# Search and open file
se () { du -a ~/.local/bin/* ~/.config/* | awk '{print $2}' | fzf | xargs -r -o $EDITOR ;}
# Search media and open it in mpv
sea () { find /mnt/Media1/Anime/**/*.mkv /mnt/Media2/Anime/**/*.mkv /mnt/Media2/Downloads/*.mkv | awk -F'|' '{print $1}' | fzf | xargs -I {} mpv "{}" ;}

# custom ls colors
export LS_COLORS="$(vivid generate snazzy)"

# Add custom scripts to path
PATH=$PATH:/home/samuli/Documents/scripts

# Typos
alias Cd='cd'
alias cD='cd'
alias CD='cd'
alias dir='ls'
alias copy='cp'

# Shortcuts
alias s='$VISUAL'

# 3-month calendar
alias cal3='cal -3'

alias editzsh='editbash'
alias sourcezsh='sourcebash'
alias neofetch='fastfetch'

# boot errors
alias error='journalctl -b -p err'

# Simple shortcut to edit this file.
function editbash() {
    colorize "^gEditing ~/.zshrc"
    s ~/.zshrc
}

# Simple shortcut to source this file.
function sourcebash() {
    colorize "Doing ^gsource ~/.zshrc"
    source ~/.zshrc
}

# Thin wrapper around Colorize.
function colorize() {
    python3 $colorizeLocation "$@"
}

# Print time in UTC
function utc() {
    colorize "LOCAL: ^y$(date)"
    colorize "UTC  : ^g$(date -u)"
}

# Copies the current directory to the clipboard.
function getcd() {
    pwd | tr -d '\n' | pbcopy
    colorize "^wCopied ^g${PWD} ^wto the clipboard"
}

# Verbosity and settings that you pretty much just always are going to want.
alias \
	cp="cp -iv" \
	mv="mv -iv" \
	rm="rm -vI" \
	mkd="mkdir -pv" \
	yt="yt-dlp --embed-metadata -i" \
	yta="yt -x -f bestaudio/best"

# Colorize commands when possible.
alias \
	ls="ls -hN --color=auto --group-directories-first" \
	grep="grep --color=auto" \
	diff="diff --color=auto"

# The following lines were added by compinstall
zstyle :compinstall filename '/home/samuli/.zshrc'
autoload -Uz compinit
compinit
# End of lines added by compinstall
source /usr/share/zsh-theme-powerlevel10k/powerlevel10k.zsh-theme
# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
source /usr/share/zsh/plugins/fast-syntax-highlighting/fast-syntax-highlighting.plugin.zsh
#source ~/.config/zsh/everforest-dark.zsh

alias config='/usr/bin/git --git-dir=/home/samuli/.cfg/ --work-tree=/home/samuli'
