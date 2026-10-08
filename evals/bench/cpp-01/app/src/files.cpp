#include "meterlog/files.hpp"

#include <fstream>

namespace meterlog {

std::size_t countLines(const std::string& path) {
    std::ifstream in(path);
    std::size_t count = 0;
    std::string line;
    while (std::getline(in, line)) {
        if (!line.empty()) {
            ++count;
        }
    }
    return count;
}

}  // namespace meterlog
