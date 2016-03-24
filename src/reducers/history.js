import { HIST_ADD } from '../actions/base';

function toArray(obj) {
  return Array.isArray(obj) ? obj : [obj];
}

const startScreen = `
                               ::   :::    :::::
                        :::    ::         :::
                        :::    ::         :::
:: ::::::    ,::::::  ::::::,  ::   ::: ,::::::  :::    :::
:::   :::   :::   :::   :::    ::   :::   :::    :::    :::
::     ::: :::     ::   :::    ::   :::   :::     ::,  :::
::     ::: ::::::::::   :::    ::   :::   :::     ,::  ::,
::     ::: ::,          :::    ::   :::   :::      :::,::
::     ::: ,::          :::    ::   :::   :::       ::::
::     :::  :::::::::   :::::  ::   :::   :::       ::::
,,     ,,,     :::,       ::,  ,,   ,,,   ,,,        ::
                                                    :::
                                                 ,::::
                                                  ,,
Welcome to netlify CLI

Deploy production sites or apps, straight from the command
line

Type help to get started
`;

export function history(state = startScreen.split('\n'), action) {

  switch (action.type) {
    case HIST_ADD:
      return state.concat(toArray(action.payload));
    default:
      return state;
  }
}
