const isCI = !!process.env.CI;

export function info(msg: string): void {
  console.log(msg);
}

export function warn(msg: string): void {
  if (isCI) {
    console.log(`::warning::${msg}`);
  } else {
    console.warn(`⚠ ${msg}`);
  }
}

export function error(msg: string): void {
  if (isCI) {
    console.log(`::error::${msg}`);
  } else {
    console.error(`✖ ${msg}`);
  }
}

export function group(title: string): void {
  if (isCI) {
    console.log(`::group::${title}`);
  } else {
    console.log(`\n── ${title} ──`);
  }
}

export function groupEnd(): void {
  if (isCI) {
    console.log("::endgroup::");
  }
}
