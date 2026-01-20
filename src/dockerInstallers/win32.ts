const installDocker = async () => {
    console.error('Script must be executed within a WSL2 or Hyper-V environment.');
    process.exit(0);
};

export default installDocker;