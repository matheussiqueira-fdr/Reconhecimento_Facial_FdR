// Lógica de matching de descriptors faciais.
//
// A face-api.js representa cada rosto como um vetor de 128 dimensões.
// Dois rostos são considerados a mesma pessoa quando a distância euclidiana
// entre seus descriptors é menor que um limiar (threshold).
// O padrão da face-api.js é 0.6; usamos um valor configurável (0.55 por
// padrão) para um pouco mais de rigidez.

export function euclideanDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error('Descriptors inválidos ou de tamanhos diferentes');
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// Recebe o descriptor capturado e a lista de pessoas cadastradas.
// Retorna a melhor correspondência (menor distância) e se passou no limiar.
export function findBestMatch(queryDescriptor, people, threshold) {
  let best = null;
  for (const person of people) {
    let stored;
    try {
      stored = JSON.parse(person.descriptor);
    } catch {
      continue;
    }
    const distance = euclideanDistance(queryDescriptor, stored);
    if (best === null || distance < best.distance) {
      best = { person, distance };
    }
  }
  if (!best) return { matched: false, distance: null, person: null };
  return {
    matched: best.distance <= threshold,
    distance: best.distance,
    person: best.person,
  };
}
