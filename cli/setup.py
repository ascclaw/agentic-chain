from setuptools import setup, find_packages

setup(
    name="agentic-chain",
    version="1.0.0",
    description="Agentic Chain CLI",
    author="Agentic Chain Foundation",
    py_modules=["agentic"],
    entry_points={
        "console_scripts": [
            "agentic=agentic:main",
        ],
    },
    python_requires=">=3.7",
    install_requires=[
        "eth-account>=0.9.0",
    ],
)
