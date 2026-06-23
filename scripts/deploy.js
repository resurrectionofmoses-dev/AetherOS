async function main() {
  const BiometricRegistry = await ethers.getContractFactory("BiometricRegistry");
  const registry = await BiometricRegistry.deploy();

  await registry.waitForDeployment();
  console.log("BiometricRegistry deployed to:", await registry.getAddress());

  // Mobilize NumericExamples deployment logic
  const NumericExamples = await ethers.getContractFactory("NumericExamples");
  const numericExamples = await NumericExamples.deploy();

  await numericExamples.waitForDeployment();
  console.log("NumericExamples deployed to:", await numericExamples.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
