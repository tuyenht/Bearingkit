#pragma once

#include <cstddef>
#include <string>

namespace meterlog {

// The number of non-empty lines of the file; 0 when it cannot be opened.
std::size_t countLines(const std::string& path);

}  // namespace meterlog
