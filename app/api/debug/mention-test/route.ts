import { NextResponse } from "next/server"

export async function GET() {
  const testText = "@[Wes Shinn](e472e9e7-7381-4d3b-b014-25a19693483f) hey this is a test"

  // Test the regex pattern
  const regexPattern = /@\[([^\]]+)\]$$([^)]+)$$/g
  const matches = Array.from(testText.matchAll(regexPattern))

  // Test string-based parsing
  const stringMatches = []
  let searchIndex = 0
  while (true) {
    const startIndex = testText.indexOf("@[", searchIndex)
    if (startIndex === -1) break

    const nameEnd = testText.indexOf("](", startIndex)
    if (nameEnd === -1) break

    const idEnd = testText.indexOf(")", nameEnd)
    if (idEnd === -1) break

    const name = testText.substring(startIndex + 2, nameEnd)
    const userId = testText.substring(nameEnd + 2, idEnd)

    stringMatches.push({ name, userId, fullMatch: testText.substring(startIndex, idEnd + 1) })
    searchIndex = idEnd + 1
  }

  return NextResponse.json({
    testText,
    regexPattern: regexPattern.toString(),
    regexMatches: matches.map((m) => ({ fullMatch: m[0], name: m[1], userId: m[2] })),
    regexMatchCount: matches.length,
    stringMatches,
    stringMatchCount: stringMatches.length,
    verdict: matches.length > 0 ? "REGEX WORKS" : "REGEX BROKEN - USE STRING PARSING",
  })
}
