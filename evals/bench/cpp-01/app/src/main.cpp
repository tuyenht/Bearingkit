#include <iostream>
#include <string>

#include "meterlog/files.hpp"

int main(int argc, char** argv) {
    if (argc == 3 && std::string(argv[1]) == "count") {
        std::cout << "lines " << meterlog::countLines(argv[2]) << "\n";
        return 0;
    }
    std::cerr << "usage: meterstat count <file>\n";
    return 1;
}
