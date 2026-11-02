import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { QuestionRowActions } from "./question-row-actions";

type Question = {
  id: string;
  key: string;
  type: "LIKERT" | "BOOLEAN" | "CHOICE";
  text: string;
  dimensionId: string | null;
  dimensionName: string | null;
  polarity: "POSITIVE" | "NEGATIVE" | null;
  allowNotApplicable: boolean;
  pairKey: string | null;
  weight: string;
  options: string[];
};

type Props = {
  instrumentId: string;
  questions: Question[];
  dimensions: { id: string; name: string }[];
  editable: boolean;
};

const TYPE_LABELS = { LIKERT: "Likert", BOOLEAN: "Ya/Tidak", CHOICE: "Pilihan" } as const;

export function QuestionTable({ instrumentId, questions, dimensions, editable }: Props) {
  if (questions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada butir. {editable ? "Tambahkan butir pertama di atas." : ""}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode</TableHead>
          <TableHead>Butir</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead>Faktor</TableHead>
          {editable ? <TableHead className="text-right">Aksi</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((question, index) => (
          <TableRow key={question.id}>
            <TableCell className="font-mono text-xs">{question.key}</TableCell>
            <TableCell className="max-w-md whitespace-normal">
              <p>{question.text}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {question.polarity === "NEGATIVE" ? <Badge variant="outline">Negatif</Badge> : null}
                {question.allowNotApplicable ? <Badge variant="outline">Boleh N/A</Badge> : null}
                {question.pairKey ? (
                  <Badge variant="outline">Pasangan: {question.pairKey}</Badge>
                ) : null}
                {question.options.length > 0 ? (
                  <Badge variant="outline">{question.options.length} opsi</Badge>
                ) : null}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{TYPE_LABELS[question.type]}</Badge>
            </TableCell>
            <TableCell className="whitespace-normal text-muted-foreground">
              {question.dimensionName ?? "—"}
            </TableCell>
            {editable ? (
              <TableCell className="text-right">
                <QuestionRowActions
                  instrumentId={instrumentId}
                  dimensions={dimensions}
                  isFirst={index === 0}
                  isLast={index === questions.length - 1}
                  question={{
                    id: question.id,
                    key: question.key,
                    type: question.type,
                    text: question.text,
                    dimensionId: question.dimensionId,
                    polarity: question.polarity,
                    allowNotApplicable: question.allowNotApplicable,
                    pairKey: question.pairKey,
                    weight: question.weight,
                    options: question.options,
                  }}
                />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
