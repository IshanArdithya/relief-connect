import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import EmergencyRequestForm from '../components/EmergencyRequestForm'
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest'
import { helpRequestService } from '../services'

export default function NeedHelp() {
  const router = useRouter()

  const handleSubmit = async (data: ICreateHelpRequest) => {
    const response = await helpRequestService.createHelpRequest(data)
    return response
  }

  return (
    <>
      <Head>
        <title>I Need Help - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <EmergencyRequestForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/')}
        isGroup={false}
      />
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}

