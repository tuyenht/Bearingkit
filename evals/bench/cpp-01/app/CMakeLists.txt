cmake_minimum_required(VERSION 3.20)
project(meterlog LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(meterlog src/files.cpp)
target_include_directories(meterlog PUBLIC include)

add_executable(meterstat src/main.cpp)
target_link_libraries(meterstat PRIVATE meterlog)

enable_testing()
add_executable(files_test tests/files_test.cpp)
target_link_libraries(files_test PRIVATE meterlog)
add_test(NAME files COMMAND files_test)
