#!/bin/sh

jq -s 'reduce .[] as $item ({}; . as $base | $item | to_entries | reduce .[] as $field ($base; 
  if ($field.value | type == "array") and ($base[$field.key] | type == "array") then 
    .[$field.key] += $field.value 
  elif ($field.value | type == "object") and ($base[$field.key] | type == "object") then 
    .[$field.key] |= ($field.value + .)
  else 
    .[$field.key] = $field.value 
  end))' "$@"
