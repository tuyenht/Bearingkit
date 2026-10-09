#include <cstdio>
#include <fstream>
#include <iostream>

#include "meterlog/files.hpp"

int main() {
    const char* path = "files_test.tmp";
    {
        std::ofstream out(path);
        out << "M-1,100\n\nM-2,200\n";
    }
    const std::size_t lines = meterlog::countLines(path);
    std::remove(path);
    if (lines != 2) {
        std::cerr << "countLines: expected 2, got " << lines << "\n";
        return 1;
    }
    if (meterlog::countLines("no-such-file.tmp") != 0) {
        std::cerr << "countLines: a missing file should count 0\n";
        return 1;
    }
    return 0;
}
