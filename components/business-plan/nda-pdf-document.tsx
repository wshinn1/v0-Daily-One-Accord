import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.5,
    textAlign: "justify",
  },
  list: {
    marginLeft: 20,
    marginBottom: 8,
  },
  listItem: {
    marginBottom: 4,
    lineHeight: 1.5,
  },
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: "1 solid #000",
  },
  signatureBox: {
    marginTop: 10,
    padding: 10,
    border: "1 solid #ccc",
    backgroundColor: "#f9f9f9",
  },
  signatureImage: {
    width: 200,
    height: 80,
    objectFit: "contain",
  },
  timestamp: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    border: "1 solid #ccc",
  },
  timestampTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timestampDetail: {
    fontSize: 9,
    marginBottom: 4,
    color: "#333",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
    borderTop: "1 solid #ccc",
    paddingTop: 10,
  },
})

interface NdaPdfDocumentProps {
  fullName: string
  email: string
  signatureData: string
  signedAt: string
  ipAddress: string
  userAgent: string
}

export const NdaPdfDocument = ({
  fullName,
  email,
  signatureData,
  signedAt,
  ipAddress,
  userAgent,
}: NdaPdfDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>MUTUAL NON-DISCLOSURE AGREEMENT</Text>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of{" "}
          {new Date(signedAt).toLocaleDateString()} by and between:
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: "bold" }}>PARTY A:</Text>
          {"\n"}Daily One Accord
          {"\n"}Represented by: Wes Shinn, Founder & CEO
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: "bold" }}>PARTY B:</Text>
          {"\n"}
          {fullName}
          {"\n"}
          {email}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>RECITALS</Text>
      <Text style={styles.paragraph}>
        WHEREAS, the Parties wish to explore a business relationship concerning church management software, technology
        solutions, and related services (the "Purpose"); and
      </Text>
      <Text style={styles.paragraph}>
        WHEREAS, in connection with the Purpose, each Party may disclose to the other certain confidential and
        proprietary information; and
      </Text>
      <Text style={styles.paragraph}>
        WHEREAS, each Party desires to protect the confidentiality of its Confidential Information;
      </Text>

      <Text style={styles.sectionTitle}>1. DEFINITION OF CONFIDENTIAL INFORMATION</Text>
      <Text style={styles.paragraph}>
        Confidential Information means any information, whether written, oral, electronic, or visual, disclosed by one
        Party to the other Party that is marked as confidential or would reasonably be considered confidential.
      </Text>

      <View style={styles.list}>
        <Text style={styles.listItem}>• Business plans, strategies, and financial information</Text>
        <Text style={styles.listItem}>• Product designs, specifications, and roadmaps</Text>
        <Text style={styles.listItem}>• Source code, algorithms, and technical documentation</Text>
        <Text style={styles.listItem}>• Customer lists, pricing information, and marketing strategies</Text>
        <Text style={styles.listItem}>• Trade secrets and proprietary methodologies</Text>
      </View>

      <Text style={styles.sectionTitle}>2. OBLIGATIONS OF RECEIVING PARTY</Text>
      <Text style={styles.paragraph}>
        The Receiving Party agrees to hold all Confidential Information in strict confidence, not disclose it to any
        third party without prior written consent, and use it solely for the Purpose.
      </Text>

      <Text style={styles.sectionTitle}>3. TERM AND TERMINATION</Text>
      <Text style={styles.paragraph}>
        This Agreement shall commence on the Effective Date and continue for two (2) years. Obligations shall survive
        termination for five (5) years.
      </Text>

      <View style={styles.signatureSection}>
        <Text style={styles.sectionTitle}>ELECTRONIC SIGNATURE</Text>
        <Text style={styles.paragraph}>
          By signing below, Party B acknowledges having read, understood, and agreed to be bound by the terms of this
          Agreement.
        </Text>

        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 10, marginBottom: 5 }}>Signature:</Text>
          <Image src={signatureData || "/placeholder.svg"} style={styles.signatureImage} />
          <Text style={{ fontSize: 10, marginTop: 10 }}>Name: {fullName}</Text>
          <Text style={{ fontSize: 10 }}>Date: {new Date(signedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.timestamp}>
        <Text style={styles.timestampTitle}>DIGITAL SIGNATURE VERIFICATION</Text>
        <Text style={styles.timestampDetail}>Timestamp: {new Date(signedAt).toLocaleString()}</Text>
        <Text style={styles.timestampDetail}>IP Address: {ipAddress}</Text>
        <Text style={styles.timestampDetail}>User Agent: {userAgent.substring(0, 100)}</Text>
        <Text style={styles.timestampDetail}>Document Version: 1.0</Text>
        <Text style={{ fontSize: 8, marginTop: 8, fontStyle: "italic" }}>
          This document was electronically signed and timestamped by Daily One Accord's secure system.
        </Text>
      </View>

      <Text style={styles.footer}>
        This is a legally binding document. Daily One Accord © {new Date().getFullYear()}. All rights reserved.
      </Text>
    </Page>
  </Document>
)
