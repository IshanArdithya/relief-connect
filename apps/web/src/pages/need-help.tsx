import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import EmergencyRequestForm from '../components/EmergencyRequestForm'
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest'
import { helpRequestService } from '../services'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'

export default function NeedHelp() {
  const router = useRouter()

  const handleSubmit = async (data: ICreateHelpRequest) => {
    console.log('[NeedHelp] Submitting help request:', data)
    
    try {
      // Call the API first
      const response = await helpRequestService.createHelpRequest(data)
      
      console.log('[NeedHelp] API response:', response)
      
      if (response.success && response.data) {
        console.log('[NeedHelp] Help request created successfully with ID:', response.data.id)
        
        // Store in localStorage to add to requests section (for backward compatibility)
        if (typeof window !== 'undefined') {
          const existingRequests: HelpRequestResponseDto[] = JSON.parse(
            localStorage.getItem('help_requests') || '[]'
          )
          const newRequest: HelpRequestResponseDto = {
            ...response.data,
          }
          existingRequests.push(newRequest)
          localStorage.setItem('help_requests', JSON.stringify(existingRequests))
        }
        
        return response
      } else {
        console.error('[NeedHelp] API request failed:', response.error)
        return {
          success: false,
          error: response.error || 'Failed to create help request. Please try again.',
        }
      }
    } catch (error) {
      console.error('[NeedHelp] Error creating help request:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create help request. Please check your connection and try again.',
      }
    }
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

