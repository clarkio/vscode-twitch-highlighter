export const naturalCompare = (a: any, b: any) => {
  let ax: any[] = [],
    bx: any[] = [];

  a.replace(/(\d+)|(\D+)/g, function (_: any, $1: any, $2: any) {
    ax.push([$1 || Infinity, $2 || '']);
  });

  b.replace(/(\d+)|(\D+)/g, function (_: any, $1: any, $2: any) {
    bx.push([$1 || Infinity, $2 || '']);
  });

  while (ax.length && bx.length) {
    let an = ax.shift();
    let bn = bx.shift();
    let nn = an[0] - bn[0] || an[1].localeCompare(bn[1]);
    if (nn) {
      return nn;
    }
  }

  return ax.length - bx.length;
};
