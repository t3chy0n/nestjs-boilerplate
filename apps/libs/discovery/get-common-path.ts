export function getCommonPath(path1, path2) {
  // Normalize and split both paths into their components
  const components1 = path1.replace(/\\/g, '/').split('/');
  const components2 = path2.replace(/\\/g, '/').split('/');

  // Initialize an empty array to store the common path components
  const commonComponents = [];

  // Iterate through both path components and compare them
  for (let i = 0; i < Math.min(components1.length, components2.length); i++) {
    // If the components are the same, add them to the common path
    if (components1[i] === components2[i]) {
      commonComponents.push(components1[i]);
    } else {
      // If the components differ, we have reached the end of the common path
      break;
    }
  }

  // Join the common path components and return the result
  return commonComponents.join('/');
}
