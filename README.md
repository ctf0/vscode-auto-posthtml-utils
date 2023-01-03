# Vscode Auto Posthtml Utils

run any/all of posthtml plugins on your file in one go,

> Currently included fixers/utilities
>
>- posthtml-alt-always
>- posthtml-aria-tabs
>- posthtml-lazyload
>- posthtml-link-noreferrer
>- posthtml-remove-duplicates
>- posthtml-schemas
>- posthtml-attrs-sorter

## Usage

- open any html based file ex.`html, blade, vue, etc..` & run `Auto PostHtml`

## Notes

- u can test with [the demo file](demo/index.html)

## Issues

- cant have nested quotes of same type, ex.
    > `class="{{ "$var" }}"`  
    > `alt='{{ __('test') }}'`
