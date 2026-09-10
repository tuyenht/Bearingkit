plugins {
    id("com.android.application") version "8.5.0"
    kotlin("android") version "2.0.0"
}

android {
    namespace = "com.example.fixture"
}

dependencies {
    implementation("androidx.compose.ui:ui:1.7.0")
}
