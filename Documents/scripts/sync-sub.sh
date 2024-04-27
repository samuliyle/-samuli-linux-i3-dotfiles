#!/bin/bash
# Extract subtitles from each MKV file in the given directory, convert possible .ass subtitles to str and then resync them using ffsubsync

# If no directory is given, work in local dir
if [ "$1" = "" ]; then
  DIR="."
else
  DIR="$1"
fi
# Get all the MKV files in this dir and its subdirs
find "$DIR" -type f -name '*.mkv' | while read filename; do
  # Find out which tracks contain the subtitles
  mkvmerge "$filename" | grep 'subtitles' | while read subline; do
    echo "extract $filename"
    format="srt"
    case "$subline" in
    *SubStationAlpha*)
      format="ass"
      ;;
    esac
    # Grep the number of the subtitle track
    tracknumber=$(echo $subline | egrep -o "[0-9]{1,2}" | head -1)

    # Get base name for subtitle
    subtitlename=${filename%.*}

    # Extract the track to a .tmp file
    $(mkvextract tracks "$filename" $tracknumber:"$subtitlename.tmp.$format" >/dev/null 2>&1)
    $(chmod g+rw "$subtitlename.tmp.$format")

    # Convert .ass to .srt
    case "$format" in
    *ass*)
      echo "convert ass to srt"
      $(ffmpeg "$subtitlename.tmp.$format" -c:s srt "$subtitlename.tmp.srt")
      $(rm "$subtitlename.tmp.$format")
      ;;
    esac

    # Resync subtitles using ffsubsync
    echo "sync $subtitlename.tmp.srt"
    $(ffsubsync "$subtitlename.tmp.srt" "$subtitlename.srt" -o "output.srt")
    $(rm "$subtitlename.tmp.srt")
    $(mv "output.srt" "$subtitlename.srt")
    $(chmod g+rw "$subtitlename.srt")
  done
done
