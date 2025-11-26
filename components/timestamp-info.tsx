"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bitcoin, ExternalLink, Clock } from "lucide-react"

interface TimestampInfoProps {
  timestamp?: string
  proof?: string
  txid?: string
}

export function TimestampInfo({ timestamp, proof, txid }: TimestampInfoProps) {
  if (!timestamp) return null

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
          <Bitcoin className="h-5 w-5" />
          Bitcoin Timestamp
        </CardTitle>
        <CardDescription>This certificate has been timestamped to the Bitcoin blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm text-slate-700 dark:text-slate-300">{new Date(timestamp).toLocaleString()}</span>
        </div>

        {proof && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">OpenTimestamps Proof</p>
            <code className="block p-2 bg-slate-100 dark:bg-slate-900 rounded text-xs font-mono overflow-x-auto">
              {proof}
            </code>
          </div>
        )}

        {txid && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://mempool.space/tx/${txid}`, "_blank")}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Block Explorer
          </Button>
        )}

        <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This timestamp provides cryptographic proof that this certificate existed at the specified time. The
            certificate hash has been anchored to the Bitcoin blockchain, making it immutable and verifiable.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
