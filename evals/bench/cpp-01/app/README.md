# meterlog

Tools for the readings files our field units upload.

## Build and test

GCC from MSYS2 (UCRT64) with CMake and Ninja; `C:\msys64\ucrt64\bin` is on the PATH of the build agents.

    cmake -S . -B build -G Ninja
    cmake --build build
    ctest --test-dir build --output-on-failure

## Commands

`meterstat count <file>` prints the number of non-empty lines of a file.

## Readings files

One reading per line, `<meter id>,<watt-hours>`, for example `M-102,48211`. A file ends with a newline.
